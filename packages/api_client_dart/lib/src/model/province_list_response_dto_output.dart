//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/province_list_response_dto_output_items_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'province_list_response_dto_output.g.dart';

/// ProvinceListResponseDtoOutput
///
/// Properties:
/// * [items] 
@BuiltValue()
abstract class ProvinceListResponseDtoOutput implements Built<ProvinceListResponseDtoOutput, ProvinceListResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<ProvinceListResponseDtoOutputItemsInner> get items;

  ProvinceListResponseDtoOutput._();

  factory ProvinceListResponseDtoOutput([void updates(ProvinceListResponseDtoOutputBuilder b)]) = _$ProvinceListResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ProvinceListResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ProvinceListResponseDtoOutput> get serializer => _$ProvinceListResponseDtoOutputSerializer();
}

class _$ProvinceListResponseDtoOutputSerializer implements PrimitiveSerializer<ProvinceListResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [ProvinceListResponseDtoOutput, _$ProvinceListResponseDtoOutput];

  @override
  final String wireName = r'ProvinceListResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ProvinceListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(ProvinceListResponseDtoOutputItemsInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ProvinceListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ProvinceListResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ProvinceListResponseDtoOutputItemsInner)]),
          ) as BuiltList<ProvinceListResponseDtoOutputItemsInner>;
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
  ProvinceListResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ProvinceListResponseDtoOutputBuilder();
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


