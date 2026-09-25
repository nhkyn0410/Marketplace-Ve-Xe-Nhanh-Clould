//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/vehicle_list_response_dto_output_items_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'vehicle_list_response_dto_output.g.dart';

/// VehicleListResponseDtoOutput
///
/// Properties:
/// * [items] 
/// * [nextCursor] 
@BuiltValue()
abstract class VehicleListResponseDtoOutput implements Built<VehicleListResponseDtoOutput, VehicleListResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<VehicleListResponseDtoOutputItemsInner> get items;

  @BuiltValueField(wireName: r'nextCursor')
  String? get nextCursor;

  VehicleListResponseDtoOutput._();

  factory VehicleListResponseDtoOutput([void updates(VehicleListResponseDtoOutputBuilder b)]) = _$VehicleListResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VehicleListResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VehicleListResponseDtoOutput> get serializer => _$VehicleListResponseDtoOutputSerializer();
}

class _$VehicleListResponseDtoOutputSerializer implements PrimitiveSerializer<VehicleListResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [VehicleListResponseDtoOutput, _$VehicleListResponseDtoOutput];

  @override
  final String wireName = r'VehicleListResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VehicleListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(VehicleListResponseDtoOutputItemsInner)]),
    );
    yield r'nextCursor';
    yield object.nextCursor == null ? null : serializers.serialize(
      object.nextCursor,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    VehicleListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VehicleListResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(VehicleListResponseDtoOutputItemsInner)]),
          ) as BuiltList<VehicleListResponseDtoOutputItemsInner>;
          result.items.replace(valueDes);
          break;
        case r'nextCursor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.nextCursor = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VehicleListResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VehicleListResponseDtoOutputBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


