//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:api_client_dart/src/model/ward_list_response_dto_output_items_inner.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'ward_list_response_dto_output.g.dart';

/// WardListResponseDtoOutput
///
/// Properties:
/// * [items] 
@BuiltValue()
abstract class WardListResponseDtoOutput implements Built<WardListResponseDtoOutput, WardListResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<WardListResponseDtoOutputItemsInner> get items;

  WardListResponseDtoOutput._();

  factory WardListResponseDtoOutput([void updates(WardListResponseDtoOutputBuilder b)]) = _$WardListResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(WardListResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<WardListResponseDtoOutput> get serializer => _$WardListResponseDtoOutputSerializer();
}

class _$WardListResponseDtoOutputSerializer implements PrimitiveSerializer<WardListResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [WardListResponseDtoOutput, _$WardListResponseDtoOutput];

  @override
  final String wireName = r'WardListResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    WardListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(WardListResponseDtoOutputItemsInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    WardListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required WardListResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(WardListResponseDtoOutputItemsInner)]),
          ) as BuiltList<WardListResponseDtoOutputItemsInner>;
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
  WardListResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = WardListResponseDtoOutputBuilder();
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


