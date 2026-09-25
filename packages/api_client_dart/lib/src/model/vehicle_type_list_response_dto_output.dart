//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/vehicle_type_list_response_dto_output_items_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'vehicle_type_list_response_dto_output.g.dart';

/// VehicleTypeListResponseDtoOutput
///
/// Properties:
/// * [items] 
@BuiltValue()
abstract class VehicleTypeListResponseDtoOutput implements Built<VehicleTypeListResponseDtoOutput, VehicleTypeListResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<VehicleTypeListResponseDtoOutputItemsInner> get items;

  VehicleTypeListResponseDtoOutput._();

  factory VehicleTypeListResponseDtoOutput([void updates(VehicleTypeListResponseDtoOutputBuilder b)]) = _$VehicleTypeListResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VehicleTypeListResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VehicleTypeListResponseDtoOutput> get serializer => _$VehicleTypeListResponseDtoOutputSerializer();
}

class _$VehicleTypeListResponseDtoOutputSerializer implements PrimitiveSerializer<VehicleTypeListResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [VehicleTypeListResponseDtoOutput, _$VehicleTypeListResponseDtoOutput];

  @override
  final String wireName = r'VehicleTypeListResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VehicleTypeListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(VehicleTypeListResponseDtoOutputItemsInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    VehicleTypeListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VehicleTypeListResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(VehicleTypeListResponseDtoOutputItemsInner)]),
          ) as BuiltList<VehicleTypeListResponseDtoOutputItemsInner>;
          result.items.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VehicleTypeListResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VehicleTypeListResponseDtoOutputBuilder();
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


