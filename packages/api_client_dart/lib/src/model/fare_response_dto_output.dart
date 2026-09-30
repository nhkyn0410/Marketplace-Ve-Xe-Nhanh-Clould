//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/fare_response_dto_output_rules_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'fare_response_dto_output.g.dart';

/// FareResponseDtoOutput
///
/// Properties:
/// * [id] 
/// * [routeId] 
/// * [routeName] 
/// * [status] 
/// * [createdAt] 
/// * [updatedAt] 
/// * [note] 
/// * [rules] 
@BuiltValue()
abstract class FareResponseDtoOutput implements Built<FareResponseDtoOutput, FareResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'routeId')
  String get routeId;

  @BuiltValueField(wireName: r'routeName')
  String get routeName;

  @BuiltValueField(wireName: r'status')
  FareResponseDtoOutputStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'rules')
  BuiltList<FareResponseDtoOutputRulesInner> get rules;

  FareResponseDtoOutput._();

  factory FareResponseDtoOutput([void updates(FareResponseDtoOutputBuilder b)]) = _$FareResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FareResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FareResponseDtoOutput> get serializer => _$FareResponseDtoOutputSerializer();
}

class _$FareResponseDtoOutputSerializer implements PrimitiveSerializer<FareResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [FareResponseDtoOutput, _$FareResponseDtoOutput];

  @override
  final String wireName = r'FareResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FareResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'routeId';
    yield serializers.serialize(
      object.routeId,
      specifiedType: const FullType(String),
    );
    yield r'routeName';
    yield serializers.serialize(
      object.routeName,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(FareResponseDtoOutputStatusEnum),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
    yield r'rules';
    yield serializers.serialize(
      object.rules,
      specifiedType: const FullType(BuiltList, [FullType(FareResponseDtoOutputRulesInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FareResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FareResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'routeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.routeId = valueDes;
          break;
        case r'routeName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.routeName = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FareResponseDtoOutputStatusEnum),
          ) as FareResponseDtoOutputStatusEnum;
          result.status = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        case r'rules':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(FareResponseDtoOutputRulesInner)]),
          ) as BuiltList<FareResponseDtoOutputRulesInner>;
          result.rules.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FareResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FareResponseDtoOutputBuilder();
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


class FareResponseDtoOutputStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const FareResponseDtoOutputStatusEnum ACTIVE = _$fareResponseDtoOutputStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const FareResponseDtoOutputStatusEnum INACTIVE = _$fareResponseDtoOutputStatusEnum_INACTIVE;

  static Serializer<FareResponseDtoOutputStatusEnum> get serializer => _$fareResponseDtoOutputStatusEnumSerializer;

  const FareResponseDtoOutputStatusEnum._(String name): super(name);

  static BuiltSet<FareResponseDtoOutputStatusEnum> get values => _$fareResponseDtoOutputStatusEnumValues;
  static FareResponseDtoOutputStatusEnum valueOf(String name) => _$fareResponseDtoOutputStatusEnumValueOf(name);
}

